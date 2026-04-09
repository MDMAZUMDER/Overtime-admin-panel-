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
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

@Composable
fun SimpleLineChart(
    data: List<Double>,
    modifier: Modifier = Modifier
) {
    val primaryColor = MaterialTheme.colorScheme.primary
    val surfaceColor = MaterialTheme.colorScheme.onSurfaceVariant

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(200.dp)
            .padding(16.dp)
    ) {
        val width = size.width
        val height = size.height
        val maxVal = (data.maxOrNull() ?: 1.0).toFloat()
        val minVal = 0f

        val spaceX = width / (data.size - 1)
        val spaceY = height / (maxVal - minVal)

        val points = data.mapIndexed { index, d ->
            Offset(
                x = index * spaceX,
                y = height - (d.toFloat() - minVal) * spaceY
            )
        }

        // Draw path
        val path = Path().apply {
            moveTo(points.first().x, points.first().y)
            points.forEach { point ->
                lineTo(point.x, point.y)
            }
        }

        drawPath(
            path = path,
            color = primaryColor,
            style = Stroke(width = 4.dp.toPx())
        )

        // Draw dots
        points.forEach { point ->
            drawCircle(
                color = primaryColor,
                radius = 6.dp.toPx(),
                center = point
            )
            drawCircle(
                color = MaterialTheme.colorScheme.surface,
                radius = 3.dp.toPx(),
                center = point
            )
        }
    }
}
