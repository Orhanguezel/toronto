"use client";

import * as React from "react";
import Image from "next/image";
import styled from "styled-components";
import { FileText } from "lucide-react";

import type { CustomPageDto } from "@/integrations/types/custom_pages.types";

import {
    Card,
    CardIcon,
    CardBody,
    CardActions,
} from "@/shared/ui/cards/SiteCard";

function isHttpUrl(v: any): v is string {
    return typeof v === "string" && /^https?:\/\//i.test(v);
}

function shouldUseNativeImg(src: string) {
    try {
        const u = new URL(src);
        return u.hostname === "images.unsplash.com";
    } catch {
        return false;
    }
}

/**
 * ✅ FE DTO'da öncelik:
 * - content_html (parse edilmiş HTML)
 * - content (alias)
 * - content_raw (JSON-string) parse edilerek html
 */
function extractHtml(post: CustomPageDto): string {
    if (typeof post.content_html === "string" && post.content_html.trim()) return post.content_html;
    if (typeof post.content === "string" && post.content.trim()) return post.content;

    const raw = post.content_raw;
    if (!raw) return "";

    try {
        const obj = JSON.parse(raw) as any;
        return typeof obj?.html === "string" ? obj.html : "";
    } catch {
        return "";
    }
}

export default function BlogFeaturedCard({
    post,
    height, // artık layout kilitlemiyoruz; prop kalsın diye alıyoruz ama kullanmıyoruz
    expanded,
    onToggle,
    ctaLabel,
}: {
    post: CustomPageDto;
    height: number;
    expanded: boolean;
    onToggle: () => void;
    ctaLabel: string; // "Read"
}) {
    const imgRaw = (post as any)?.featured_image || (post as any)?.featuredImage || null;
    const img = isHttpUrl(imgRaw) ? imgRaw : null;

    const alt =
        (post as any)?.featured_image_alt ||
        (post as any)?.featuredImageAlt ||
        post.title ||
        "Blog image";

    const useNative = img ? shouldUseNativeImg(img) : false;

    const html = React.useMemo(() => extractHtml(post), [post]);
    const hasDetail = Boolean(html && html.trim().length);

    return (
        <Card style={{ display: "flex", flexDirection: "column" as any }}>
            <Hero>
                {img ? (
                    useNative ? (
                        <HeroImg src={img} alt={alt} loading="lazy" referrerPolicy="no-referrer" />
                    ) : (
                        <Image
                            src={img}
                            alt={alt}
                            fill
                            sizes="(max-width: 980px) 100vw, 900px"
                            style={{ objectFit: "cover" }}
                            priority={false}
                        />
                    )
                ) : null}

                <HeroOverlay />

                <HeroHead>
                    <IconWrap aria-hidden>
                        <FileText size={18} />
                    </IconWrap>
                    <HeroTitle>{post.title || "Blog"}</HeroTitle>
                </HeroHead>
            </Hero>

            {/* ✅ Summary her zaman görünür */}
            <SummaryArea>
                <CardBody style={{ paddingTop: 12 }}>
                    {post.summary || "Open the post to read more."}
                </CardBody>
            </SummaryArea>

            {/* ✅ Read tıklandıysa detay summary altına açılır */}
            {expanded ? (
                <DetailArea>
                    {hasDetail ? (
                        <RichHtml dangerouslySetInnerHTML={{ __html: html }} />
                    ) : (
                        <CardBody style={{ paddingTop: 12 }}>
                            Content is not available yet.
                        </CardBody>
                    )}
                </DetailArea>
            ) : null}

            <ActionsBar>
                <CardActions style={{ marginLeft: "auto" }}>
                    <ReadBtn type="button" onClick={onToggle}>
                        {expanded ? "Close" : ctaLabel}
                    </ReadBtn>
                </CardActions>
            </ActionsBar>
        </Card>
    );
}

const Hero = styled.div`
  position: relative;
  height: 210px;
  border-radius: 14px;
  overflow: hidden;
  margin: 12px 12px 0 12px;
`;

const HeroImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.62));
`;

const HeroHead = styled.div`
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconWrap = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(8px);
`;

const HeroTitle = styled.div`
  font-weight: 900;
  font-size: 18px;
  line-height: 1.15;
`;

const SummaryArea = styled.div`
  padding: 0 12px;
`;

const DetailArea = styled.div`
  padding: 0 12px 6px 12px;
`;

const RichHtml = styled.div`
  padding: 10px 4px 0 4px;
  line-height: 1.65;

  p { margin: 0 0 10px 0; }
  ul, ol { margin: 0 0 12px 18px; }
  a { text-decoration: underline; }
`;

const ActionsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 12px 12px 12px;
`;

const ReadBtn = styled.button`
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: rgba(255,255,255,0.10);
  }
`;
