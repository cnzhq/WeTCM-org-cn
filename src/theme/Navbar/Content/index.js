import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useLocation} from '@docusaurus/router';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';

function normalizeNavbarItem(item) {
  if (item.type === 'docSidebar') {
    return {
      label: item.label,
      to: '/docs/intro',
    };
  }

  return {
    label: item.label,
    to: item.to,
    href: item.href,
  };
}

function NavbarLink({item, onClick}) {
  return (
    <Link
      className="wetcmAppleNavLink"
      to={item.to}
      href={item.href}
      onClick={onClick}>
      {item.label}
    </Link>
  );
}

export default function NavbarContent() {
  const {
    navbar: {title, logo, items},
  } = useThemeConfig();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tocVisible, setTocVisible] = useState(true);
  const mobileSidebar = useNavbarMobileSidebar();
  const navItems = items.map(normalizeNavbarItem).filter((item) => item.label);
  const logoSrc = useBaseUrl(logo?.src ?? '');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setMenuOpen(false);
    setTocVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || isHomePage) {
      return undefined;
    }

    let hideTimer = window.setTimeout(() => {
      if (!mobileSidebar.shown) {
        setTocVisible(false);
      }
    }, 3000);

    const showThenScheduleHide = () => {
      setTocVisible(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        if (!mobileSidebar.shown) {
          setTocVisible(false);
        }
      }, 3000);
    };

    window.addEventListener('scroll', showThenScheduleHide, {passive: true});

    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener('scroll', showThenScheduleHide);
    };
  }, [isHomePage, location.pathname, mobileSidebar.shown]);

  useEffect(() => {
    if (mobileSidebar.shown) {
      setTocVisible(true);
    }
  }, [mobileSidebar.shown]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    document.documentElement.classList.toggle('wetcmAppleNavOpen', menuOpen);

    return () => {
      document.documentElement.classList.remove('wetcmAppleNavOpen');
    };
  }, [menuOpen]);

  return (
    <>
      <div className="navbar__inner wetcmAppleNavInner">
        <div className="wetcmAppleNavStart">
        <Link className="wetcmAppleNavBrand" to="/" aria-label={`${title} 首页`}>
          {logoSrc ? (
            <img
              className="wetcmAppleNavLogo"
              src={logoSrc}
              alt={logo?.alt ?? title}
              width="20"
              height="20"
            />
          ) : null}
          <span>{title}</span>
        </Link>
      </div>

      <div className="wetcmAppleNavDesktop" aria-label="主要导航">
        {navItems.map((item) => (
          <NavbarLink key={`${item.label}-${item.to ?? item.href}`} item={item} />
        ))}
      </div>

      <div className="wetcmAppleNavTools">
        <span className="wetcmAppleNavSearch" aria-hidden="true" />
        <NavbarColorModeToggle className="wetcmAppleNavThemeToggle" />
        <button
          className="wetcmAppleNavMenuButton"
          type="button"
          aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={menuOpen}
          aria-controls="wetcm-apple-mobile-menu"
          onClick={() => {
            if (mobileSidebar.shown) {
              mobileSidebar.toggle();
            }
            setMenuOpen((open) => !open);
          }}>
          <span />
          <span />
        </button>
      </div>

        <div
          id="wetcm-apple-mobile-menu"
          className="wetcmAppleNavMobile"
          hidden={!menuOpen}>
          <nav aria-label="移动端导航">
            {navItems.map((item) => (
              <NavbarLink
                key={`mobile-${item.label}-${item.to ?? item.href}`}
                item={item}
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </nav>
        </div>
      </div>

      {!mobileSidebar.disabled && !isHomePage ? (
        <button
          className={`wetcmWikiTocToggle ${
            tocVisible || mobileSidebar.shown
              ? 'wetcmWikiTocToggleVisible'
              : 'wetcmWikiTocToggleHidden'
          }`}
          type="button"
          aria-label={mobileSidebar.shown ? '关闭目录' : '打开目录'}
          aria-expanded={mobileSidebar.shown}
          onClick={() => {
            setMenuOpen(false);
            mobileSidebar.toggle();
          }}>
          <span className="wetcmWikiTocIcon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>目录</span>
        </button>
      ) : null}
    </>
  );
}
