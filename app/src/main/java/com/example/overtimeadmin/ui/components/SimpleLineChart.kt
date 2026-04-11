// File: app/src/main/java/com/example/overtimeadmin/ui/components/SimpleLineChart.kt
package com.example.overtimeadmin.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

@Composable
fun SimpleLineChart(
    data: List<Double>,
    modifier: Modifier = Modifier
) {
    if (data.isEmpty()) return

    val primaryColor = MaterialTheme.colorScheme.primary
    val surfaceColor = MaterialTheme.colorScheme.surface
    val gradientColor = primaryColor.copy(alpha = 0.2f)

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(200.dp)
            .padding(horizontal = 8.dp, vertical = 16.dp)
    ) {
        val width = size.width
        val height = size.height
        val maxVal = (data.maxOrNull() ?: 1.0).toFloat() * 1.2f // Add some headroom
        val minVal = 0f

        val spaceX = if (data.size > 1) width / (data.size - 1) else 0f
        val range = maxVal - minVal
        
        val points = data.mapIndexed { index, d ->
            Offset(
                x = index * spaceX,
                y = height - (d.toFloat() - minVal) / range * height
            )
        }

        // Draw fill gradient
        val fillPath = Path().apply {
            moveTo(0f, height)
            if (points.isNotEmpty()) {
                var prevPoint = points[0]
                lineTo(prevPoint.x, prevPoint.y)
                if (points.size > 1) {
                    for (i in 1 until points.size) {
                        val currentPoint = points[i]
                        val controlPoint1 = Offset(prevPoint.x + (currentPoint.x - prevPoint.x) / 2, prevPoint.y)
                        val controlPoint2 = Offset(prevPoint.x + (currentPoint.x - prevPoint.x) / 2, currentPoint.y)
                        cubicTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, currentPoint.x, currentPoint.y)
                        prevPoint = currentPoint
                    }
                }
            }
            lineTo(width, height)
            close()
        }

        if (points.isNotEmpty()) {
            drawPath(
                path = fillPath,
                brush = Brush.verticalGradient(
                    colors = listOf(gradientColor, Color.Transparent),
                    startY = points.minOf { it.y },
                    endY = height
                )
            )
        }

        // Draw smooth line
        val strokePath = Path().apply {
            if (points.isNotEmpty()) {
                var prevPoint = points[0]
                moveTo(prevPoint.x, prevPoint.y)
                if (points.size > 1) {
                    for (i in 1 until points.size) {
                        val currentPoint = points[i]
                        val controlPoint1 = Offset(prevPoint.x + (currentPoint.x - prevPoint.x) / 2, prevPoint.y)
                        val controlPoint2 = Offset(prevPoint.x + (currentPoint.x - prevPoint.x) / 2, currentPoint.y)
                        cubicTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, currentPoint.x, currentPoint.y)
                        prevPoint = currentPoint
                    }
                }
            }
        }

        drawPath(
            path = strokePath,
            color = primaryColor,
            style = Stroke(width = 3.dp.toPx())
        )

        // Draw points
        points.forEach { point ->
            drawCircle(
                color = primaryColor,
                radius = 4.dp.toPx(),
                center = point
            )
            drawCircle(
                color = surfaceColor,
                radius = 2.dp.toPx(),
                center = point
            )
        }
    }
}
