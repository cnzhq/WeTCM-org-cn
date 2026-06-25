import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

export default function TimePage() {
  const [currentTime, setCurrentTime] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const animationFrameRef = useRef();

  // 1. 初始化：网络校时
  useEffect(() => {
    async function fetchNetworkTime() {
      try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        const data = await response.json();
        
        const networkTime = new Date(data.utc_datetime).getTime();
        const localTime = Date.now();
        
        setOffset(networkTime - localTime);
        setLoading(false);
      } catch (error) {
        console.error("网络校时失败，降级使用本机时间", error);
        setOffset(0);
        setLoading(false);
      }
    }
    fetchNetworkTime();
  }, []);

  // 2. 动画循环
  useEffect(() => {
    if (loading) return;

    const tick = () => {
      setCurrentTime(new Date(Date.now() + offset));
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loading, offset]);

  // 3. 渲染逻辑：时间数字
  const renderTimeDisplay = (date, timeZone) => {
    if (!date) return <div style={timeWrapperStyle}>-- : -- : --</div>;

    const options = { timeZone: timeZone, hour12: false };
    const parts = new Intl.DateTimeFormat('en-US', {
      ...options,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(date);

    const getPart = (type) => parts.find(p => p.type === type)?.value;
    
    // 强制补零，确保始终是 3 位数 (0 -> 000, 12 -> 012)
    const ms = date.getMilliseconds().toString().padStart(3, '0');

    return (
      <div style={timeWrapperStyle}>
        {/* 时分秒区域 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{getPart('hour')}</span>
            <span style={blinkingColonStyle}>:</span>
            <span>{getPart('minute')}</span>
            <span style={blinkingColonStyle}>:</span>
            <span>{getPart('second')}</span>
        </div>

        {/* 毫秒区域：独立容器，固定宽度 */}
        <div style={msWrapperStyle}>
          <span style={{ opacity: 0.5, margin: '0 2px 0 6px', fontWeight: 'normal' }}>.</span>
          <span style={msDigitStyle}>{ms}</span>
        </div>
      </div>
    );
  };

  // 4. 渲染逻辑：日期格式化
  const formatDate = (date, timeZone) => {
    if (!date) return "Loading...";
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  };

  // 5. 渲染逻辑：时区偏移 (新增功能)
  const formatOffset = (date, timeZone) => {
    if (!date) return "";
    
    // 使用 longOffset 获取如 "GMT+08:00" 的格式
    const part = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      timeZoneName: 'longOffset'
    }).formatToParts(date).find(p => p.type === 'timeZoneName');

    // 将默认的 GMT 替换为 UTC，符合用户偏好
    return part ? part.value.replace('GMT', 'UTC') : '';
  };

  return (
    <Layout title="标准网络时钟" description="Network Time Protocol Clock">
      <Head>
        <style>{`
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        `}</style>
      </Head>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', textAlign: 'center', padding: '2rem'
      }}>
        <h1 style={{ marginBottom: '3rem' }}>网络校时</h1>
        
        {loading ? (
          <h2>正在从原子钟服务器同步时间...</h2>
        ) : (
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* 卡片 1: 本设备时间 */}
            <div style={clockCardStyle}>
              <h3>本设备所在时区</h3>
              {renderTimeDisplay(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}
              
              <div style={dateStyle}>
                {formatDate(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}
              </div>
              
              {/* 新增: 时区偏移量显示 */}
              <div style={offsetStyle}>
                {formatOffset(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}
              </div>

              <small style={{color: '#888'}}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</small>
            </div>

            {/* 卡片 2: UTC 时间 */}
            <div style={clockCardStyle}>
              <h3>UTC协调世界时</h3>
              {renderTimeDisplay(currentTime, 'UTC')}
              
              <div style={dateStyle}>
                {formatDate(currentTime, 'UTC')}
              </div>

              {/* 新增: 时区偏移量显示 */}
              <div style={offsetStyle}>
                {formatOffset(currentTime, 'UTC')}
              </div>

              <small style={{color: '#888'}}>Coordinated Universal Time</small>
            </div>

          </div>
        )}
        
        <p style={{ marginTop: '3rem', opacity: 0.6, fontSize: '0.9rem' }}>
          * 时间源自 worldtimeapi.org，包含毫秒级精度修正
        </p>
      </div>
    </Layout>
  );
}

// --- 样式定义 ---

const clockCardStyle = {
  background: 'var(--ifm-card-background-color)',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  minWidth: '520px', 
  maxWidth: '90vw' 
};

const timeWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '3.5rem',
  fontWeight: 'bold',
  fontFamily: "'CMSFont', 'MiSans', 'PingFang SC', 'Microsoft YaHei', 'Source Han Serif SC', serif",
  margin: '1rem 0',
  color: 'var(--ifm-color-primary)',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap'
};

const blinkingColonStyle = {
  margin: '0 0.2rem',
  paddingBottom: '0.5rem',
  animation: 'blink 1s step-start infinite',
};

const msWrapperStyle = {
  display: 'flex',
  alignItems: 'baseline', 
};

const msDigitStyle = {
  fontSize: '2rem',
  width: '80px', 
  textAlign: 'left', 
  opacity: 0.8,
  fontFamily: "'CMSFont', 'MiSans', 'PingFang SC', 'Microsoft YaHei', serif" 
};

const dateStyle = {
  fontSize: '1.2rem',
  fontWeight: '500'
};

// 新增的偏移量样式
const offsetStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'var(--ifm-color-primary)',
  margin: '0.5rem 0',
  fontFamily: "'MiSans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
};
