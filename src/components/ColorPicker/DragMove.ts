export interface DragMoveConfig {
  start?: (e: MouseEvent) => void;
  move?: (e: MouseEvent) => void;
  end?: (e: MouseEvent) => void;
}
export function onDragMove(config: DragMoveConfig) {
  let el: HTMLElement;
  const onMouseDown = (ev: MouseEvent) => {
    ev.stopImmediatePropagation();
    config.start && config.start(ev);
    document.onselectstart = () => false;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  const onMouseMove = (ev: MouseEvent) => {
    ev.target === el && config.move && config.move(ev);
  };
  const onMouseUp = (ev: MouseEvent) => {
    ev.target === el && config.end && config.end(ev);
    document.onselectstart = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  return {
    init: (dom: HTMLElement) => {
      el = dom;
      el.addEventListener('mousedown', onMouseDown);
    },

    destroyed: () => {
      el.removeEventListener('mousedown', onMouseDown);
    }
  };
}
