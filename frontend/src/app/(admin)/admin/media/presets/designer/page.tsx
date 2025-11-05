// src/app/(admin)/admin/media/presets/designer/page.tsx

'use client';
import React, { useState } from 'react';
import styled from 'styled-components';
import Cropper from 'react-easy-crop';
import { IMG } from '@/lib/media/presets';

const Wrap = styled.div`display:grid; grid-template-columns: 1.2fr .8fr; gap:16px;`;
const Stage = styled.div`position:relative; border:1px solid ${({theme})=>theme.colors.border}; border-radius:${({theme})=>theme.radii.lg}px; overflow:hidden; aspect-ratio:16/9;`;
const Panel = styled.div`display:grid; gap:10px;`;

export default function PresetDesigner(){
  const [image,setImage] = useState<string>('https://res.cloudinary.com/demo/image/upload/sea');
  const [preset,setPreset] = useState({ key:'hero', w:1600, h:700, crop:'fill', gravity:'custom', quality:'auto', format:'auto' });
  const [zoom,setZoom] = useState(1);
  const [pos,setPos] = useState({ x:0, y:0 });

  return (
    <Wrap>
      <Stage>
        <Cropper image={image} crop={pos} zoom={zoom} aspect={preset.w/preset.h} onCropChange={setPos} onZoomChange={setZoom} showGrid />
      </Stage>
      <Panel>
        <label>Preset Key <input value={preset.key} onChange={e=>setPreset({...preset, key:e.target.value})}/></label>
        <label>Width <input type="number" value={preset.w} onChange={e=>setPreset({...preset, w:+e.target.value})}/></label>
        <label>Height <input type="number" value={preset.h} onChange={e=>setPreset({...preset, h:+e.target.value})}/></label>
        <label>Crop
          <select value={preset.crop} onChange={e=>setPreset({...preset, crop:e.target.value as any})}>
            <option value="fill">fill</option>
            <option value="thumb">thumb</option>
            <option value="crop">crop</option>
          </select>
        </label>
        <label>Gravity
          <select value={preset.gravity} onChange={e=>setPreset({...preset, gravity:e.target.value as any})}>
            <option value="custom">custom</option>
            <option value="auto">auto</option>
            <option value="face">face</option>
            <option value="faces">faces</option>
            <option value="subject">subject</option>
          </select>
        </label>
        <button onClick={async()=>{
          await fetch('/api/_admin/media/presets/'+preset.key, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ width:preset.w, height:preset.h, crop:preset.crop, gravity:preset.gravity, quality:preset.quality, format:preset.format, active:true }) });
          alert('Preset kaydedildi');
        }}>Kaydet</button>
      </Panel>
    </Wrap>
  );
}