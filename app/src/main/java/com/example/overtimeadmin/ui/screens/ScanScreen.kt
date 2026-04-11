package com.example.overtimeadmin.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Collections
import androidx.compose.material.icons.outlined.FlashlightOff
import androidx.compose.material.icons.outlined.FlashlightOn
import androidx.compose.material.icons.outlined.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanScreen(onBack: () -> Unit) {
    var isFlashOn by remember { mutableStateOf(false) }
    val infiniteTransition = rememberInfiniteTransition(label = "scanner")
    
    // Animation for the scanning line
    val scanLineY by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scanLine"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0A)) // Deep dark background
    ) {
        // Simulated Camera Feed with Gradient
        Box(
            modifier = Modifier.fillMaxSize()
        ) {
            // Dark overlay to simulate camera focus
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.radialGradient(
                            colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.8f)),
                            radius = 1000f
                        )
                    )
            )
        }

        // Scanner UI Layer
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 48.dp, start = 20.dp, end = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.1f))
                ) {
                    androidx.compose.material3.Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                
                Text(
                    "Scanner",
                    color = Color.White,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )

                IconButton(
                    onClick = { /* History action */ },
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.1f))
                ) {
                    androidx.compose.material3.Icon(Icons.Outlined.History, contentDescription = "History", tint = Color.White)
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Scanner Frame
            Box(
                modifier = Modifier
                    .size(280.dp)
                    .padding(10.dp),
                contentAlignment = Alignment.Center
            ) {
                // Corner Borders
                ScannerCorners()

                // Scanning Line
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.8f)
                        .height(2.dp)
                        .offset(y = ((-110).dp + (220.dp * scanLineY)))
                        .background(
                            Brush.horizontalGradient(
                                listOf(Color.Transparent, Color(0xFF6200EE), Color.Transparent)
                            )
                        )
                        .shadow(8.dp, spotColor = Color(0xFF6200EE))
                )
            }

            Text(
                "Scanning for QR Code...",
                color = Color.White.copy(alpha = 0.7f),
                modifier = Modifier.padding(top = 32.dp),
                style = MaterialTheme.typography.bodyMedium
            )

            Spacer(modifier = Modifier.weight(1f))

            // Bottom Controls (Glassmorphism)
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 40.dp, start = 24.dp, end = 24.dp),
                color = Color.White.copy(alpha = 0.05f),
                shape = RoundedCornerShape(32.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
            ) {
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ControlItem(
                        icon = Icons.Outlined.Collections,
                        label = "Gallery",
                        onClick = { /* Gallery action */ }
                    )
                    
                    // Main Flash Toggle
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(if (isFlashOn) Color(0xFF6200EE) else Color.White.copy(alpha = 0.1f))
                            .clickable { isFlashOn = !isFlashOn },
                        contentAlignment = Alignment.Center
                    ) {
                        androidx.compose.material3.Icon(
                            imageVector = if (isFlashOn) Icons.Outlined.FlashlightOn else Icons.Outlined.FlashlightOff,
                            contentDescription = "Flash",
                            tint = Color.White,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    ControlItem(
                        icon = Icons.Default.Info,
                        label = "Help",
                        onClick = { /* Help action */ }
                    )
                }
            }
        }
    }
}

@Composable
fun ScannerCorners() {
    Box(modifier = Modifier.fillMaxSize()) {
        val color = Color(0xFF6200EE)
        val strokeWidth = 4.dp
        val cornerSize = 40.dp

        // Top Left
        Box(modifier = Modifier
            .align(Alignment.TopStart)
            .size(cornerSize)
            .border(strokeWidth, color, RoundedCornerShape(topStart = 12.dp))
        )
        // Top Right
        Box(modifier = Modifier
            .align(Alignment.TopEnd)
            .size(cornerSize)
            .border(strokeWidth, color, RoundedCornerShape(topEnd = 12.dp))
        )
        // Bottom Left
        Box(modifier = Modifier
            .align(Alignment.BottomStart)
            .size(cornerSize)
            .border(strokeWidth, color, RoundedCornerShape(bottomStart = 12.dp))
        )
        // Bottom Right
        Box(modifier = Modifier
            .align(Alignment.BottomEnd)
            .size(cornerSize)
            .border(strokeWidth, color, RoundedCornerShape(bottomEnd = 12.dp))
        )
    }
}

@Composable
fun ControlItem(icon: ImageVector, label: String, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }
    ) {
        androidx.compose.material3.Icon(icon, contentDescription = label, tint = Color.White, modifier = Modifier.size(24.dp))
        Text(label, color = Color.White.copy(alpha = 0.6f), fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
    }
}
