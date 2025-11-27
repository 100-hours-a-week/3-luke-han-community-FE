export function Modal() {
  return `
    <div id="dm-modal" class="dm-modal" hidden>
      <div class="dm-modal-backdrop"></div>

      <div class="dm-modal-sheet">
        <h2 id="dm-modal-title" class="dm-modal-title"></h2>
        <p id="dm-modal-text" class="dm-modal-text"></p>

        <div id="dm-modal-actions" class="dm-modal-actions"></div>
      </div>
    </div>
  `;
}