import 'dart:convert';
import 'dart:math';

import 'package:deriv_chart/deriv_chart.dart' hide AddOnsRepository;
import 'package:chart_app/src/add_ons/add_ons_repository.dart';

/// State and methods of chart web adapter config.
class DrawingToolModel {
  /// Initialize
  DrawingToolModel();

  /// Drawing tools repo
  final AddOnsRepository<DrawingToolConfig> drawingToolsRepo =
      AddOnsRepository<DrawingToolConfig>();

  /// To add or update a drawing
  void addDrawing(String dataString, int? index) {
    final Map<String, dynamic> config = json.decode(dataString)..remove('id');

    final DrawingToolConfig? drawingToolConfig =
        DrawingToolConfig.fromJson(config);

    drawingToolsRepo.add(drawingToolConfig!);
  }

  /// To remove an existing drawing tool
  void removeDrawingTool(int index) {
    drawingToolsRepo.remove(index);
  }

  /// To clear all drawing tool
  void clearDrawingTool() {
    drawingToolsRepo.clear();
  }

  /// Binary search
  int? binarySearch(List<Tick> ticks, int epoch, int min, int max) {
    if (max >= min) {
      final int mid = ((max + min) / 2).floor();
      if (epoch == ticks[mid].epoch) {
        return mid;
      } else if (epoch > ticks[mid].epoch) {
        return binarySearch(ticks, epoch, mid + 1, max);
      } else {
        return binarySearch(ticks, epoch, min, mid - 1);
      }
    }
    return null;
  }
}