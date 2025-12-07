import { PostToolbar } from "../../atoms/PostToolBar.js";
import { PostHero } from "../../molecules/main/Intro.js";

export function MainPage() {
  return `
    <div class="post-page">
      ${PostHero()}
      ${PostToolbar()}
      <section class="post-list-wrapper"></section>
    </div>
  `;
}