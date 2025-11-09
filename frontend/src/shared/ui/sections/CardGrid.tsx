"use client";

import styled from "styled-components";

const CardGrid = styled.div`
  display: grid;
  gap: clamp(12px, 2vw, 24px);
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

export default CardGrid;
