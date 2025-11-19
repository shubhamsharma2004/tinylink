import prisma from "../lib/prisma";

export async function getServerSideProps({ params, res }) {
  const { code } = params;
  const link = await prisma.link.findUnique({ where: { code } });

  if (!link) {
    return { notFound: true };
  }

  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 }, lastClicked: new Date() }
  });

  res.setHeader("Location", link.target);
  res.statusCode = 302;
  res.end();

  return { props: {} };
}

export default function RedirectPage() {
  return null;
}
