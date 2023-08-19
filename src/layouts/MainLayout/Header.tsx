import { LogoutOutlined } from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Dropdown,
  List,
  Popover,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash-es';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useSocket } from '@/api';
import FlagUK from '@/assets/images/flag-uk.svg';
import FlagVN from '@/assets/images/flag-vn.svg';
import { MENU_ITEMS } from '@/constants';
import { useAuthStore, useTranslateStore } from '@/context';
import { BellIcon, EnvelopIcon } from '@/icons';
import {
  isWsNofitications,
  isWsNotification,
} from '@/services/websocket.service';
import { twcx } from '@/utils';

type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  const t = useTranslations();
  const [{ lang }, translateDispatch] = useTranslateStore();

  const { lastJsonMessage, getAllNotifications, readAllNotifications } =
    useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    getAllNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isWsNotification(lastJsonMessage)) {
      getAllNotifications();
    }

    if (isWsNofitications(lastJsonMessage)) {
      setNotifications(lastJsonMessage as any);
    }
  }, [getAllNotifications, lastJsonMessage]);

  const [{ user }, authDispatch] = useAuthStore();
  const hadLogin = !!user;

  const { asPath, push } = useRouter();
  const [, currentPath] = asPath.split('/');

  const onLogout = () => {
    push('/');
    authDispatch({ type: 'SIGN_OUT' });
  };

  const NAV_ITEMS = [
    { href: '/', name: t('header.home') },
    { href: '/garages', name: t('header.listGarages') },
    { href: '#service', name: t('header.services') },
    { href: '#about', name: t('header.aboutUs') },
    { href: '#contact', name: t('header.contact') },
    { href: '/my-garages', name: t('header.myGarage'), hide: !hadLogin },
  ];

  return (
    <header
      className={twcx(className, 'h-20 flex items-center container mx-auto')}
    >
      <Link className="block" href="/">
        <div className="uppercase font-bold">
          <span>Garage</span> <span className="text-primary">Finder</span>
        </div>
      </Link>
      <nav className={twcx('grow flex justify-end')}>
        <ul
          className={twcx('flex gap-8', {
            ['hidden']: user?.role === 'STAFF',
          })}
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={twcx({
                  ['text-blue-600']: `/${currentPath}` === item.href,
                  ['hidden']: item.hide,
                })}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Divider
        type="vertical"
        className={twcx('h-8 bg-gray-800 mx-8', {
          ['hidden']: user?.role === 'STAFF',
        })}
      />

      <div>
        {user ? (
          <div className="flex gap-6 items-center">
            <div className="rounded-full p-2 flex items-center justify-center w-4 h-4 border-slate-100 shadow-md">
              <Popover
                placement="bottomLeft"
                content={
                  <div>
                    <div
                      className="text-right text-primary font-medium cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onMouseDown={() => {
                        readAllNotifications();
                        getAllNotifications();
                      }}
                    >
                      Đánh dấu tất cả đã đọc
                    </div>
                    <Divider className="mt-2" />
                    <div className="max-h-96 w-64">
                      {notifications.map((item) => (
                        <div
                          key={uniqueId()}
                          className="flex gap-4 items-center"
                        >
                          <div className="grow">
                            <div className="text-xs text-neutral-500">
                              {dayjs(item?.DateTime).format(
                                'DD/MM/YYYY hh:mm A'
                              )}
                            </div>
                            <div className="font-semibold text-neutral-700">
                              {item?.Content}
                            </div>
                          </div>

                          <Badge
                            status="processing"
                            className={twcx({ invisible: item?.IsRead })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                }
              >
                <Badge
                  count={
                    notifications.filter((item) => !item.IsRead).length || 0
                  }
                >
                  <BellIcon className="text-xl text-neutral-700 cursor-pointer" />
                </Badge>
              </Popover>
            </div>

            <div
              tabIndex={0}
              role="button"
              className={twcx(
                'rounded-full p-2 flex items-center justify-center w-4 h-4 border-slate-100 shadow-md',
                {
                  ['hidden']: user?.role === 'STAFF',
                }
              )}
              onMouseDown={() => push('/manage/chat')}
            >
              <EnvelopIcon className="text-xl text-neutral-700 cursor-pointer" />
            </div>

            <Dropdown
              menu={{
                items: [
                  ...(user.role === 'STAFF' ? [] : MENU_ITEMS),
                  {
                    key: 'logout',
                    label: (
                      <div
                        className="flex gap-2"
                        role="button"
                        tabIndex={0}
                        onMouseUp={onLogout}
                      >
                        <LogoutOutlined />
                        <span>Đăng xuất</span>
                      </div>
                    ),
                    danger: true,
                  },
                ],
              }}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                <Avatar src={user.avatar} />
                <Typography>{user.fullName}</Typography>
              </div>
            </Dropdown>
          </div>
        ) : (
          <Link href="/sign-in ">
            <Button className="border-primary text-primary">Đăng nhập</Button>
          </Link>
        )}
      </div>

      <div
        className="ml-4 h-[30px] rounded overflow-hidden cursor-pointer"
        role="button"
        tabIndex={0}
        onMouseDown={() =>
          translateDispatch({
            type: 'CHANGE_LANG',
            payload: {
              lang: lang === 'vi' ? 'en' : 'vi',
            },
          })
        }
      >
        {lang === 'vi' ? <FlagVN /> : <FlagUK />}
      </div>
    </header>
  );
}
