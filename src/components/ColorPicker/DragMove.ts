export interface DragMoveConfig {
  start?: (e: MouseEvent) => void;
  move?: (e: MouseEvent) => void;
  end?: (e: MouseEvent) => void;
}
export function onDragMove(config: DragMoveConfig) {
  let el: HTMLElement;
  const onMouseDown = (ev: MouseEvent) => {
    config.start && config.start(ev);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    console.log('start', ev);
  };
  const onMouseMove = (ev: MouseEvent) => {
    ev.target === el && config.move && config.move(ev);
    // console.log('move', ev );
  };
  const onMouseUp = (ev: MouseEvent) => {
    ev.target === el && config.end && config.end(ev);
    // console.log("end", ev);

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
