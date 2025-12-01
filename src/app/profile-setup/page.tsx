
import { ProfileQuestionnaire } from '@/components/valuscan/profile-questionnaire';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileSetupPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="border-none shadow-none bg-transparent mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Calibrate Your AI</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Answer a few questions to personalize your ReFurrm Scan experience.
          </CardDescription>
        </CardHeader>
      </Card>
      <ProfileQuestionnaire />
    </div>
  );
}
