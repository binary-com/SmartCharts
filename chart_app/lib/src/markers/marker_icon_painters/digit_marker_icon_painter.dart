import 'package:chart_app/src/markers/marker_group.dart';
import 'package:chart_app/src/markers/marker_group_icon_painter.dart';
import 'package:chart_app/src/markers/web_marker.dart';
import 'package:flutter/material.dart';
import 'package:deriv_chart/deriv_chart.dart';
import 'package:chart_app/src/markers/helpers/paint_functions/paint_end_marker.dart';
import 'package:chart_app/src/markers/helpers/paint_functions/paint_start_marker.dart';
import 'package:chart_app/src/markers/helpers/paint_functions/paint_start_line.dart';

/// Digits contract painter
class DigitMarkerIconPainter extends MarkerGroupIconPainter {
  @override
  void paintMarkerGroup(
    Canvas canvas,
    Size size,
    ChartTheme theme,
    MarkerGroup markerGroup,
    EpochToX epochToX,
    QuoteToY quoteToY,
  ) {
    for (final WebMarker marker in markerGroup.markers) {
      final Offset center = Offset(
        epochToX(marker.epoch),
        quoteToY(marker.quote),
      );

      _drawMarker(canvas, size, theme, marker, center, markerGroup.style);
    }
  }

  void _drawMarker(Canvas canvas, Size size, ChartTheme theme, WebMarker marker,
      Offset anchor, MarkerStyle style) {
    switch (marker.markerType) {
      case MarkerType.activeStart:
        paintStartLine(canvas, size, marker, anchor, style);
        break;

      case MarkerType.start:
        _drawStartPoint(canvas, size, theme, marker, anchor, style);
        break;

      case MarkerType.exit:
        final Paint paint = Paint()..color = style.backgroundColor;
        paintEndMarker(canvas, theme, anchor - const Offset(1, 20), style);

        const Color fontColor = Colors.white;
        _drawTick(canvas, marker, anchor, style, paint, fontColor);
        break;
      case MarkerType.tick:
        final Paint paint = Paint()
          ..color = style.backgroundColor
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5;

        final Color fontColor = style.backgroundColor;
        _drawTick(canvas, marker, anchor, style, paint, fontColor);
        break;
      default:
        break;
    }
  }

  void _drawTick(Canvas canvas, Marker marker, Offset anchor, MarkerStyle style,
      Paint paint, Color fontColor) {
    canvas
      ..drawCircle(
        anchor,
        8,
        Paint()..color = Colors.white,
      )
      ..drawCircle(
        anchor,
        8,
        paint,
      );

    final String lastChar = marker.quote.toString().characters.last;
    final TextSpan span = TextSpan(
      text: lastChar,
      style: TextStyle(
        fontSize: 12,
        color: fontColor,
        fontWeight: FontWeight.bold,
      ),
    );

    final TextPainter painter = TextPainter(textDirection: TextDirection.ltr)
      ..text = span
      ..layout();

    painter.paint(
      canvas,
      anchor - Offset(painter.width / 2, painter.height / 2),
    );
  }

  void _drawStartPoint(Canvas canvas, Size size, ChartTheme theme,
      WebMarker marker, Offset anchor, MarkerStyle style) {
    if (marker.quote != 0) {
      paintStartMarker(canvas, anchor - const Offset(10, 20), style, 20);
    }

    if (marker.text != null) {
      final TextStyle textStyle = TextStyle(
        color: style.backgroundColor,
        fontSize: style.activeMarkerText.fontSize,
        fontWeight: FontWeight.bold,
        backgroundColor: theme.base08Color,
      );

      final TextPainter textPainter = makeTextPainter(marker.text!, textStyle);

      final Offset iconShift =
          Offset(textPainter.width / 2, 20 + textPainter.height);

      paintWithTextPainter(
        canvas,
        painter: textPainter,
        anchor: anchor - iconShift,
        anchorAlignment: Alignment.centerLeft,
      );
    }
  }
}
