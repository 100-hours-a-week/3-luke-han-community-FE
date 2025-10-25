import { getPostDetail, createPost, updatePost, uploadToS3 } from "../common/api.js";

// 요소
const logo = document.querySelector('.logo');
const backButton = document.querySelector('.back_button');
const titleInput = document.querySelector('.title_input');
const contentInput = document.querySelector('.content_input');
const imageInput = document.getElementById('imageInput');
const submitButton = document.querySelector('.submit_button');
const warningEl = document.querySelector('.warning');
const pageTitleEl = document.querySelector('.edit_title');

// 경고 표시
function setWarning(msg) {
  if (!warningEl) return;
  warningEl.textContent = msg || '';
  warningEl.style.display = msg ? 'block' : 'none';
}

// URL 기준 모드/ID 판별: /post/create | /post/{id}/edit
function getModeAndId() {
  const parts = window.location.pathname.split('/').filter(Boolean); // ['post','create'] | ['post','123','edit']
  const isCreate = parts[1] === 'create';
  const isEdit = parts[2] === 'edit';
  const id = isEdit ? parts[1] : null;
  return { mode: isCreate ? 'create' : 'edit', id };
}

const { mode, id: POST_ID } = getModeAndId();

// 라벨/버튼 텍스트
if (pageTitleEl) pageTitleEl.textContent = mode === 'create' ? '게시글 작성' : '게시글 수정';
if (submitButton) submitButton.textContent = mode === 'create' ? '작성' : '수정';

// 수정 모드 프리필
async function prefillIfEdit() {
  if (mode !== 'edit' || !POST_ID) return;
  try {
    const res = await getPostDetail(POST_ID);
    if (!res.ok) return;

    // 응답: PostDetailWrapper { author, post: { title, content, images, ... }, comments }
    const data = await res.json();
    const post = data?.post || {};

    if (titleInput) titleInput.value = post.title ?? '';
    if (contentInput) contentInput.value = post.content ?? '';
    // 이미지 프리뷰 필요 시 여기에 표시 로직 추가 (현재는 입력만 있음)
  } catch (e) {
    console.error('prefill 실패', e);
  }
}

// 제출
submitButton?.addEventListener('click', async () => {
  const title = (titleInput?.value || '').trim();
  const content = (contentInput?.value || '').trim();

  if (!title || !content) {
    setWarning('제목과 내용을 입력하세요.');
    return;
  }
  setWarning('');

  // 이미지 파일명 목록 추출
  const files = imageInput?.files ? Array.from(imageInput.files) : [];
  const images = files.map(f => f.name);
  console.log('업로드할 이미지 파일들:', images);

  const isImageChanged = mode === 'edit' && files.length > 0;

  const body = JSON.stringify({ title, content, images, isImageChanged });
  console.log('전송 바디:', body);

  try {
    let res;
    if (mode === 'create') {
      res = await createPost(body);
      console.log('게시글 생성 응답:', res);
    } else {
      res = await updatePost(POST_ID, body);
    }

    if (!res.ok) {
      // 메시지 최대한 뽑아보기
      let msg = mode === 'create' ? '작성 실패' : '수정 실패';
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {
        try {
          const txt = await res.text();
          if (txt) msg = txt;
        } catch {}
      }
      setWarning(msg);
      return;
    }

    // 성공 시 이동: 생성은 목록(/), 수정은 상세(/post/{id})
    if (mode === 'create') {
      const created = await res.json();
      const presignedUrls = created?.presignedUrls || [];

      if (presignedUrls.length > 0 && imageInput?.files?.length) {
        const uploadPromises = presignedUrls.map((url, index) => {
          uploadToS3(url, imageInput.files[index]);
        });

        try {
          await Promise.all(uploadPromises);
          console.log("모든 이미지 업로드 성공");
        } catch (e) {
          console.error("이미지 업로드 중 오류:", e);
          setWarning('일부 이미지 업로드에 실패했어요.');
          return;
        }
      }

      // window.location.href = `/post/${POST_ID}`;
    } else {
      window.location.href = `/post/${POST_ID}`;
    }
  } catch (e) {
    setWarning('네트워크 오류가 발생했어요.');
  }
});

prefillIfEdit();
