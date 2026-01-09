import { formatMoney } from "../../core/utils.js";

export function drawBarChart(canvas, labels, values, color = "#333") {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const max = Math.max(...values, 1);
  const barWidth = width / values.length;

  values.forEach((value, i) => {
    const barHeight = (value / max) * (height - 30);

    ctx.fillStyle = color;
    ctx.fillRect(
      i * barWidth + 10,
      height - barHeight - 20,
      barWidth - 20,
      barHeight
    );

    ctx.fillStyle = "#e6e6e6";
    ctx.font = "12px sans-serif";
    ctx.fillText(
      labels[i],
      i * barWidth + 10,
      height - 5
    );
  });
}
