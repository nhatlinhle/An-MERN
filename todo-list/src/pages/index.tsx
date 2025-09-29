import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <h1>Hành trình học NextJs của Norman</h1>
      <button onClick={() => router.push("/todo")}>
        Chuyển sang trang ToDo
      </button>
    </>
  );
}
