export function trap(container: HTMLElement){
  const sel = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(sel)).filter(el=> !el.hasAttribute('disabled'));
  const first = nodes[0], last = nodes[nodes.length-1];
  function onKey(e: KeyboardEvent){
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKey);
  return ()=> container.removeEventListener('keydown', onKey);
}