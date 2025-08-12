import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Coding Test Platform</title>
        <meta name="description" content="コーディングテストプラットフォーム" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>コーディングテストプラットフォーム</h1>
        <p>環境セットアップが完了しました</p>
      </main>
    </>
  )
}