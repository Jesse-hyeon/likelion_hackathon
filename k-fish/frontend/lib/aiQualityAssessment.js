function calculateGrade(averageScore) {
  if (averageScore >= 90) return 'A+';
  if (averageScore >= 80) return 'A';
  if (averageScore >= 70) return 'B+';
  if (averageScore >= 60) return 'B';
  if (averageScore >= 50) return 'C';
  return 'D';
}

function generateFreshnessScore(productName) {
  const baseScore = 60 + Math.random() * 30;
  const variation = (Math.random() - 0.5) * 10;
  return Math.min(100, Math.max(0, baseScore + variation));
}

function generateColorScore() {
  const baseScore = 65 + Math.random() * 25;
  const variation = (Math.random() - 0.5) * 8;
  return Math.min(100, Math.max(0, baseScore + variation));
}

function generateSizeScore() {
  const baseScore = 70 + Math.random() * 20;
  const variation = (Math.random() - 0.5) * 5;
  return Math.min(100, Math.max(0, baseScore + variation));
}

function generateDamageScore() {
  const baseScore = 75 + Math.random() * 20;
  const variation = (Math.random() - 0.5) * 10;
  return Math.min(100, Math.max(0, baseScore + variation));
}

function getFreshnessDetails(score) {
  if (score >= 90) return '최상급 신선도 - 방금 잡은 것과 동일한 상태';
  if (score >= 80) return '우수한 신선도 - 매우 신선한 상태 유지';
  if (score >= 70) return '양호한 신선도 - 일반적인 유통 수준';
  if (score >= 60) return '보통 신선도 - 약간의 시간 경과 확인';
  return '신선도 저하 - 빠른 유통 필요';
}

function getColorDetails(score) {
  if (score >= 90) return '완벽한 색상과 광택 - 최상급 품질';
  if (score >= 80) return '우수한 색상 유지 - 자연스러운 광택';
  if (score >= 70) return '양호한 색상 - 일반적인 수준';
  if (score >= 60) return '색상 변화 시작 - 주의 필요';
  return '색상 변화 확인 - 품질 저하';
}

function getSizeDetails(score) {
  if (score >= 90) return '최적 크기 및 형태 - 상품성 최고';
  if (score >= 80) return '우수한 크기 - 균일한 형태';
  if (score >= 70) return '표준 크기 - 일반적인 형태';
  if (score >= 60) return '크기 편차 존재 - 선별 필요';
  return '크기 불균일 - 추가 선별 필요';
}

function getDamageDetails(score) {
  if (score >= 90) return '손상 없음 - 완벽한 상태';
  if (score >= 80) return '미미한 흔적 - 상품성 영향 없음';
  if (score >= 70) return '경미한 손상 - 판매 가능';
  if (score >= 60) return '일부 손상 - 가격 조정 필요';
  return '손상 확인 - 세심한 검토 필요';
}

export async function assessQuality(images, productName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const freshness = generateFreshnessScore(productName);
      const colorShine = generateColorScore();
      const sizeShape = generateSizeScore();
      const damage = generateDamageScore();
      
      const averageScore = (freshness + colorShine + sizeShape + damage) / 4;
      const overallGrade = calculateGrade(averageScore);
      
      const confidence = 85 + Math.random() * 10;
      
      resolve({
        freshness,
        colorShine,
        sizeShape,
        damage,
        overallGrade,
        confidence,
        details: {
          freshnessDetails: getFreshnessDetails(freshness),
          colorDetails: getColorDetails(colorShine),
          sizeDetails: getSizeDetails(sizeShape),
          damageDetails: getDamageDetails(damage)
        }
      });
    }, 2000 + Math.random() * 1000);
  });
}

export function getGradeColor(grade) {
  switch (grade) {
    case 'A+':
      return 'bg-green-500';
    case 'A':
      return 'bg-green-400';
    case 'B+':
      return 'bg-blue-500';
    case 'B':
      return 'bg-blue-400';
    case 'C':
      return 'bg-yellow-500';
    case 'D':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getGradeTextColor(grade) {
  switch (grade) {
    case 'A+':
      return 'text-green-600';
    case 'A':
      return 'text-green-500';
    case 'B+':
      return 'text-blue-600';
    case 'B':
      return 'text-blue-500';
    case 'C':
      return 'text-yellow-600';
    case 'D':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}