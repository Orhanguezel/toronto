"use client";
import * as React from "react";
import styled from "styled-components";

type Props = React.HTMLAttributes<HTMLElement> & {
  id: string;
  container?: boolean;
  children: React.ReactNode;
};

const Outer = styled.section`
  /* Navbar yüksekliği + güvenli boşluk: JS’siz offset */
  scroll-margin-top: calc(var(--navbar-h, 96px) + 24px);
`;

const Inner = styled.div`
  /* varsa mevcut container stilini burada koru */
`;

export default function Section({ id, container, children, ...rest }: Props) {
  return (
    <Outer id={id} {...rest}>
      {container ? <Inner>{children}</Inner> : children}
    </Outer>
  );
}
