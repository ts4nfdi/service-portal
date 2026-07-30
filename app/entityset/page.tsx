import Image from "next/image";
import { getRequestLocale } from "../libs/locale";
import { entitySetMessages } from "./messages";


export default async function EntitySet() {
  const t = entitySetMessages[await getRequestLocale()];
  return (
    <div className='col-span-3'>
        <div className="">
            <p className="header-main-1 !mt-0 inline-block">{t.title}</p>
        </div>
        <div className='grid md:grid-cols-9 md:gap-4'>
            <div className="card-background md:col-span-5">
                <h3 className='header-main-3'>{t.what}</h3>
                <p className='text-justify'>
                    {t.descriptionStart}<b>{t.entitySet}</b>{t.descriptionEnd}
                </p>

            </div>
            <div className='md:col-span-4 card-background float-right'>
                <h4 className='header-main-3'>{t.figure}</h4>
                <Image
                    src={"img/entity-sets.png"}
                    width={525}
                    height={130}
                    alt={t.alt}
                    placeholder="blur"
                    blurDataURL="/blur.webp"
                    style={{ margin: 'auto' }}
                />
            </div>
        </div>
    </div>
  );
}
