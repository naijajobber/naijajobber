import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CmsPageDocument = HydratedDocument<CmsPage>;

@Schema({ timestamps: true, collection: 'cms_pages' })
export class CmsPage {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  bodyHtml!: string;

  @Prop({ trim: true, default: '' })
  seoTitle!: string;

  @Prop({ trim: true, default: '' })
  seoDescription!: string;

  @Prop({
    type: String,
    enum: ['DRAFT', 'PUBLISHED'],
    default: 'DRAFT',
  })
  status!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CmsPageSchema = SchemaFactory.createForClass(CmsPage);

export type BlogPostDocument = HydratedDocument<BlogPost>;

@Schema({ timestamps: true, collection: 'blog_posts' })
export class BlogPost {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  bodyMarkdown!: string;

  @Prop({ trim: true, default: '' })
  excerpt!: string;

  @Prop({
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'PUBLISHED'],
    default: 'DRAFT',
  })
  status!: string;

  @Prop({ type: Date, default: null })
  scheduledAt!: Date | null;

  @Prop({ type: Date, default: null })
  publishedAt!: Date | null;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
