import { ClockCircleFilled, LikeFilled, WalletFilled } from '@ant-design/icons';
import { Button, Form, Input, Select, Typography } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useGetFeaturedGarages } from '@/api';
import { CarIllustrate, GarageCard } from '@/components';
import Contact from '@/components/Contact/Contact';
import { GARAGE_SERVICES, VIETNAM_PROVINCES } from '@/constants';

export default function HomePage() {
  const router = useRouter();

  const { data: garages } = useGetFeaturedGarages();

  const districts = VIETNAM_PROVINCES.map((province) => ({
    label: province.name,
    value: province.code,
  }));

  return (
    <div className="bg-[#FAF8FC]">
      <section className="grid grid-cols-5 min-h-[500px] ml-10">
        <div className="flex flex-col justify-center col-span-2">
          <Typography.Title className="uppercase text-slate-800 w-4/5 ml-10 mb-5">
            CÁCH NHANH CHÓNG VÀ DỄ DÀNG ĐỂ ĐẶT DỊCH VỤ chăm sóc xe hơi
          </Typography.Title>
          <Typography.Text className="text-slate-600 w-4/5 ml-10">
            Chào mừng bạn đến với Garage Finder ! Chúng tôi hiểu rằng chiếc xe
            của bạn là một phần quan trọng trong cuộc sống của bạn và chúng tôi
            ở đây để đảm bảo rằng nó vận hành trơn tru.
          </Typography.Text>
        </div>
        <div style={{ transform: 'rotateY(180deg)' }} className="col-span-3">
          <CarIllustrate />
        </div>
      </section>

      <section className="px-6">
        <div className="rounded-lg shadow-lg p-10 -translate-y-4 bg-white border">
          <Form
            layout="vertical"
            className="flex justify-between gap-4"
            onFinish={(values) => {
              const { keyword, provineID, categoriesID } = values;

              router.push(
                `/garages?keyword=${keyword || ''}&provineID=${
                  provineID || ''
                }&categoriesID=${categoriesID || ''}`
              );
            }}
          >
            <Form.Item label="Garage" className="grow" name="keyword">
              <Input placeholder="Nhập tên garage" />
            </Form.Item>

            <Form.Item label="Địa điểm" className="grow" name="provineID">
              <Select
                options={districts}
                placeholder="Tỉnh / Thành phố"
                mode="multiple"
                maxTagCount={2}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              label="Loại dịch vụ"
              className="grow"
              name="categoriesID"
            >
              <Select
                placeholder="Chọn loại dịch vụ"
                options={GARAGE_SERVICES}
                mode="multiple"
              />
            </Form.Item>

            <Form.Item className="flex items-end">
              <Button htmlType="submit" type="primary">
                Tìm kiếm
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>

      <section className="mt-20">
        <Typography.Title level={2} className="text-center">
          Đề xuất cho bạn
        </Typography.Title>

        <div className="grid grid-cols-4 gap-x-6 gap-y-8">
          {garages?.map((item) => (
            <GarageCard
              key={item.garageID}
              address={item.addressDetail}
              id={item.garageID}
              image={item.thumbnail}
              rating={item.star}
              title={item.garageName}
              totalRate={item.feedbacksNumber}
            />
          ))}
        </div>
      </section>
      <section className="ml-auto mr-auto max-w-[1280px] mt-[200px] text-center">
        <h2 id="service" className="title text-3xl font-bold mb-[100px] ">
          Dịch vụ
        </h2>
        <div className="list-services grid grid-cols-2 gap-10">
          <div className="service-card bg-white shadow-2xl p-5 w-[600px] rounded-xl">
            <div className="flex">
              <div>
                <h3 className="text-2xl font-semibold mb-5">Sửa chữa</h3>
                <div className="content">
                  <p className="mb-3">
                    Dịch vụ sửa chữa ô tô là các thủ tục được thực hiện để sửa
                    hoặc phục hồi xe đang gặp sự cố, hư hỏng về máy móc.
                  </p>
                  <button className=" text-white mt-3 py-2 px-8 bg-purple-600 rounded-md border-none">
                    Chi tiết
                  </button>
                </div>
              </div>
              <Image src="/repair.png" alt="repair" width={241} height={192} />
            </div>
          </div>
          <div className="service-card bg-white shadow-2xl p-5 w-[600px] rounded-xl">
            <div className="flex">
              <div>
                <h3 className="text-2xl font-semibold mb-5">Tân Trang</h3>
                <div className="content">
                  <p className="mb-3">
                    Dịch vụ tân trang ô tô là một quy trình toàn diện nhằm phục
                    hồi một chiếc xe cũ hoặc bị hư hỏng về tình trạng gần như
                    nguyên bản.
                  </p>
                  <button className=" text-white mt-3 py-2 px-8 bg-purple-600 rounded-md border-none">
                    Chi tiết
                  </button>
                </div>
              </div>
              <Image
                src="/refurbished.png"
                alt="hehe"
                width={241}
                height={192}
                className="w-[200px] h-[200px]"
              />
            </div>
          </div>
          <div className="service-card bg-white shadow-2xl p-5 w-[600px] rounded-xl">
            <div className="flex">
              <div>
                <h3 className="text-2xl font-semibold mb-5">Bảo dưỡng</h3>
                <div className="content">
                  <p className="mb-3">
                    Dịch vụ bảo dưỡng ô tô là các quy trình định kỳ giúp giữ cho
                    xe hoạt động trơn tru và ngăn ngừa các vấn đề tiềm ẩn.
                  </p>
                  <button className=" text-white mt-3 py-2 px-8 bg-purple-600 rounded-md border-none">
                    Chi tiết
                  </button>
                </div>
              </div>
              <Image
                src="/maintenance.png"
                alt="hehe"
                width={241}
                height={192}
                className="h-[170px] w-[200px]"
              />
            </div>
          </div>
          <div className="service-card bg-white shadow-2xl p-5 w-[600px] rounded-xl">
            <div className="flex">
              <div>
                <h3 className="text-2xl font-semibold mb-5">Cứu hộ</h3>
                <div className="content">
                  <p className="mb-3">
                    Họ sẽ giúp, khắc phục nhanh chóng các trường hợp xe gặp sự
                    cố bất ngờ như hư xăm, xịt lốp, hư khóa, bị ngập xe trời
                    mưa, hư ắc quy, bị tai nạn….
                  </p>
                  <button className="text-white mt-3 py-2 px-8 bg-purple-600 rounded-md border-none">
                    Chi tiết
                  </button>
                </div>
              </div>
              <Image
                src="/rescue.png"
                alt="hehe"
                width={241}
                height={192}
                className="w-[241px] h-[192px]"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="ml-auto mr-auto max-w-[1280px] mt-[200px] text-center">
        <h2 id="about" className="title text-3xl font-bold mb-[100px] ">
          Về chúng tôi
        </h2>
        <div className="flex gap-10 justify-between">
          <div>
            <Image
              src="/about-us.png"
              alt="about-us"
              width={600}
              height={540}
              className="w-[600px] h-[450px] "
            />
          </div>
          <div className="grid grid-cols-1 w-[500px]">
            <div>
              <h3 className="text-xl">Đặt lịch 24/7</h3>
              <div>
                <ClockCircleFilled
                  style={{ fontSize: '35px', color: '#8A79EF' }}
                />
              </div>
              <p>Đặt bất cứ lúc nào, từ bất cứ đâu chỉ trong vài giây.</p>
            </div>
            <div className="">
              <h3 className="text-xl">Không cần thanh toán trước</h3>
              <div>
                <WalletFilled style={{ fontSize: '35px', color: '#8A79EF' }} />
              </div>
              <p className="">
                Không cần thanh toán trước. Bạn luôn thanh toán trực tiếp cho
                nhà xe sau khi họ hoàn thành mọi công việc.
              </p>
            </div>
            <div>
              <h3 className="text-xl">Đánh giá trung thực</h3>
              <div>
                <LikeFilled style={{ fontSize: '40px', color: '#8A79EF' }} />
              </div>
              <p>
                Những đánh giá này chỉ có thể được gửi sau khi cuộc hẹn đã được
                thực hiện, vì vậy bạn có thể chắc chắn rằng tất cả chúng đều là
                thật 100%.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Contact></Contact>
    </div>
  );
}
