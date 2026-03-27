import Image from "next/image";


export default function EntitySet() {
  return (
    <div className='col-span-3'>
        <div className="">
            <p className="header-main-1 !mt-0 inline-block">TS4NFDI Entity Sets</p>
        </div>
        <div className='grid md:grid-cols-9 md:gap-4'>
            <div className="card-background md:col-span-5">
                <h3 className='header-main-3'>What is an Entity Set?</h3>
                <p className='text-justify'>
                    An <b>Entity Set</b> is a set of selected IRIs that is flat, optionally ordered, which means it
                    contains no semantic relations among the entities in that set, and that was created for a specific
                    purpose or context in which this set is relevant. An entity set can consist of entities from several
                    terminologies from different sources.
                </p>

            </div>
            <div className='md:col-span-4 card-background float-right'>
                <h4 className='header-main-3'> Figure of an Entity Set</h4>
                <Image
                    src={"img/entity-sets.png"}
                    width={525}
                    height={130}
                    alt="example of an entity set"
                    placeholder="blur"
                    blurDataURL="/blur.webp"
                    style={{ margin: 'auto' }}
                />
            </div>
        </div>
    </div>
  );
}
