import MeetingPage from "../meetingpage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params: { id } }: PageProps) {
  // return <div>hii</div>
  return <MeetingPage id={id} />;
}
