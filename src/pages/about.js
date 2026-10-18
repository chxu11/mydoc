import Layout from '@theme/Layout';

import styles from './about.module.css';

const poemLines = [
  '如此幸福的一天。',
  '雾一早就散了，我在花园里干活。',
  '蜂鸟停在忍冬花上。',
  '这世上没有一样东西我想占有。',
  '我知道没有一个人值得我羡慕。',
  '任何我曾遭受的不幸，我都已忘记。',
  '想到故我今我同为一人并不使人难为情。',
  '在我身上没有痛苦。',
  '直起腰来，我望见蓝色的大海和帆影。',
];

export default function About() {
  return (
    <Layout
      title="关于「学者」"
      description="关于「学者」：米沃什《礼物》，与一句「比较笨，一直学习」的自白。">
      <main className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.poem}>
            <p>
              {poemLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            <div className={styles.attribution}>——米沃什《礼物》（西川 译）</div>
          </div>

          <p className={styles.signature}>
            比较笨，一直学习，要不，叫我<span className={styles.signatureAccent}>「学者」</span>吧。
          </p>
        </div>
      </main>
    </Layout>
  );
}
