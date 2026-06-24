import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  
  if (params?.type === 'recovery' && params?.code) {
    redirect(`/reset-password?code=${params.code}`);
  }
  
  if (params?.code) {
    redirect(`/login?code=${params.code}`);
  }

  redirect("/login");
}
