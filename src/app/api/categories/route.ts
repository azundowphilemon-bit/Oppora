import { NextRequest, NextResponse } from 'next/server';
import {
  addCategoryRecord,
  getCategories,
  toggleCategoryRecord,
} from '@/lib/repository';
import { CategoryItem, SectionType } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') as SectionType | null;
  const categories = await getCategories(section || undefined);
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const section = String(body.section || '') as SectionType;
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();

    if (!['opportunities', 'accommodation', 'exchange', 'help'].includes(section)) {
      return NextResponse.json({ error: 'Invalid section.' }, { status: 400 });
    }
    if (name.length < 3 || name.length > 60) {
      return NextResponse.json(
        { error: 'Category name must be between 3 and 60 characters.' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const created = await addCategoryRecord({
      id: `cat-${section}-${slug}-${Date.now().toString(36)}`,
      section,
      name,
      slug,
      description: description || `${name} listings across Ghana and Africa.`,
      isActive: true,
    });

    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to create category.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: 'Category ID required.' }, { status: 400 });
    }
    const updated: CategoryItem | null = await toggleCategoryRecord(body.id);
    if (!updated) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }
    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error('PATCH /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 });
  }
}
