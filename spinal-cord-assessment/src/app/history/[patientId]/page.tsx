type Props = {
  params: Promise<{
    patientId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { patientId } = await params;

  return (
    <div style={{ padding: 40 }}>
      <h1>Assessment History</h1>
      <p>Patient ID: {patientId}</p>
    </div>
  );
}