import { BACKGROUND_IMAGES } from "@/store";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen w-screen overflow-hidden flex justify-center items-center bg-primary">
      {/* <div className="absolute top-0 left-0 h-screen w-screen -z-50 md:hidden">
        <Image
          width={740}
          height={100}
          alt="background"
          className="w-full h-full object-cover"
          src={BACKGROUND_IMAGES[0]}
        />
      </div> */}
      <div className="w-full bg-primary-light h-full p-2 md:w-[85%] md:h-[90%] overflow-hidden md:rounded-lg md:p-6 flex justify-center items-center">
        {children}
      </div>
    </main>
  );
}
