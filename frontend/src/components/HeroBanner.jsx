import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const bannerImages = [
  { id: 1, url: '/banners/banner-1.jpg', alt: 'Promo Diskon Digital' },
  { id: 2, url: '/banners/banner-2.jpg', alt: 'Template Desain Terbaru' },
  { id: 3, url: '/banners/banner-3.jpg', alt: 'Koleksi E-book Terbaik' },
];

function HeroBanner() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 z-0 relative">
      <div className="relative group rounded-lg shadow-lg z-0">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          effect="slide"
          speed={900}
          spaceBetween={30}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          className="rounded-lg"
        >
          {bannerImages.map((image) => (
            <SwiperSlide key={image.id}>
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-auto object-cover md:h-80 rounded-lg"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* tombol prev */}
        <div className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 -left-4 z-10 cursor-pointer
                        bg-white/60 hover:bg-white p-3 rounded-full 
                        opacity-0 group-hover:opacity-100 
                        transition-all duration-500 ease-in-out 
                        transform translate-x-6 group-hover:translate-x-0 
                        scale-90 group-hover:scale-100 shadow-md">
          <FaChevronLeft className="text-gray-800" />
        </div>

        {/* tombol next */}
        <div className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 -right-4 z-10 cursor-pointer
                        bg-white/60 hover:bg-white p-3 rounded-full
                        opacity-0 group-hover:opacity-100 
                        transition-all duration-500 ease-in-out 
                        transform -translate-x-6 group-hover:translate-x-0 
                        scale-90 group-hover:scale-100 shadow-md">
          <FaChevronRight className="text-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
