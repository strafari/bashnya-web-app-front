import { Suspense } from "react";
import Header from "./Header";

export default function HeaderWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Header />
    </Suspense>
  );
}