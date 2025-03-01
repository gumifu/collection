import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | ユーザープロフィール",
    default: "ユーザープロフィール",
  },
};

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return <>{children}</>;
};

export default ProfileLayout;
