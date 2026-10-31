import type { Metadata } from "next";
import FeaturedHomes from "@/components/landing/FeaturedHomes";
import Story from "@/components/landing/Story";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Story />
      <FeaturedHomes />
    </>
  );
}
