import { BusinessDetailsProps } from "../lib/type";

const BusinessDescription = ({ business }: BusinessDetailsProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold">Description</h2>
      <p className="mt-4 text-gray-600">{business?.about}</p>

      <h2 className="mt-8 text-2xl font-bold">Gallery</h2>
      <div className="grid grid-cols-2 gap-5 mt-5 md:grid-cols-3 lg:grid-cols-4">
        {business?.images.map((item, index) => (
          <img
            src={item.url}
            key={index}
            alt="image"
            width={700}
            height={200}
            loading="lazy"
            decoding="async"
            className="rounded-lg"
          />
        ))}
      </div>
    </div>
  );
};

export default BusinessDescription;
