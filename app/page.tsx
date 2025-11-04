import Image from 'next/image';


export default function Home() {
    return (
        <>
            <div className='bg-red-500 md:col-span-3 max-h-[120px] text-right '>
                <h1 className='header-1'>What is TS4NFDI?</h1>
            </div>
            <div className=''>
                <Image
                    src={"/logo.png"}
                    width={400}
                    height={400}
                    alt="TS4NFDI Logo"
                    placeholder="blur"
                    blurDataURL="/blur.webp"
                />
            </div>
            <div className='md:col-span-2 bg-yellow-500 min-h-[50px]'>
                <p className='text-justify'>
                    Terminology Services 4 NFDI (TS4NFDI) is a cross-domain service for the provision, curation,
                    development, harmonization, and mapping of terminologies. It aims to facilitate consensus-building
                    and interoperability of services across disciplines to achieve a shared knowledge representation and
                    knowledge engineering framework. The service seeks to integrate and converge individual solutions
                    into a standardized, interoperable, and sustainable service suite with Service Wrapper, API Gateway,
                    mapping service, and reusable GUI widgets.
                </p>
            </div>
        </>
    );
}
