import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type React from 'react';
import Image from 'next/image';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const withBasePath = (src?: string) => {
  if (!src || !src.startsWith('/')) return src;
  return `${basePath}${src}`;
};

const resolveImageSrc = (src: React.ComponentProps<typeof Image>['src']) => {
  if (typeof src === 'string') return withBasePath(src) ?? src;
  return src;
};

const resolveImageSize = (
  props: React.ComponentProps<typeof Image>,
  src: React.ComponentProps<typeof Image>['src'],
) => {
  if (props.fill) return { fill: true as const };
  if (typeof src === 'string') {
    return {
      width: props.width ?? 1200,
      height: props.height ?? 675,
    };
  }
  return {
    width: props.width,
    height: props.height,
  };
};

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => {
      // fumadocs-mdx turns local images into static imports, so `src` can be
      // an object at runtime even though the HTML <img> type says otherwise.
      const imageProps = props as unknown as React.ComponentProps<typeof Image>;
      const src = resolveImageSrc(imageProps.src);
      const sizeProps = resolveImageSize(imageProps, src);
      return (
        <Image {...imageProps} {...sizeProps} alt={imageProps.alt ?? ''} src={src} />
      );
    },
    ...components,
  };
}
