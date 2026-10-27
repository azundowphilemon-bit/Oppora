import { NextRequest, NextResponse } from 'next/server';
import {
  getStorageBucketName,
  getSupabaseServerClient,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { validateImageUpload } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const validation = validateImageUpload({
      mimeType: file.type,
      sizeBytes: file.size,
      fileName: file.name,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify magic bytes for JPEG, PNG, or WebP
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isWebp =
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP';

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json(
        { error: 'File header does not match a valid JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage when configured
    if (isSupabaseConfigured) {
      const supabase = getSupabaseServerClient(true);
      if (supabase) {
        const ext = isPng ? 'png' : isWebp ? 'webp' : 'jpg';
        const objectPath = `uploads/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const bucket = getStorageBucketName();

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(objectPath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (!uploadError) {
          const { data: pubData } = supabase.storage
            .from(bucket)
            .getPublicUrl(objectPath);
          if (pubData?.publicUrl) {
            return NextResponse.json({
              url: pubData.publicUrl,
              storage: 'supabase',
            });
          }
        }
      }
    }

    // Fallback: return validated inline data URL for local persistence
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    return NextResponse.json({
      url: dataUrl,
      storage: 'local_validated',
    });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: 'Failed to validate and process uploaded photo.' },
      { status: 500 }
    );
  }
}
