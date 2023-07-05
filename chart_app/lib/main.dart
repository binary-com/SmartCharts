import 'dart:collection';
import 'dart:ui';
import 'package:chart_app/src/helpers/marker_painter.dart';
import 'package:chart_app/src/helpers/series.dart';
import 'package:deriv_chart/deriv_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

import 'src/models/chart_data.dart';
import 'src/models/chart_config.dart';
import 'src/interop/dart_interop.dart';
import 'src/interop/js_interop.dart';
import 'src/markers/marker_group_series.dart';

void main() {
  runApp(const DerivChartApp());
}

/// The start of the application.
class DerivChartApp extends StatelessWidget {
  /// Initialize
  const DerivChartApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => MaterialApp(
        theme: ThemeData.light(),
        home: const _DerivChartWebAdapter(),
      );
}

class _DerivChartWebAdapter extends StatefulWidget {
  const _DerivChartWebAdapter({Key? key}) : super(key: key);

  @override
  State<_DerivChartWebAdapter> createState() => _DerivChartWebAdapterState();
}

class _DerivChartWebAdapterState extends State<_DerivChartWebAdapter> {
  _DerivChartWebAdapterState() {
    chartConfigModel = ChartConfigModel(_controller);
    initDartInterop(chartConfigModel, chartDataModel, _controller);
    JsInterop.onChartLoad();
  }

  final ChartController _controller = ChartController();

  final ChartDataModel chartDataModel = ChartDataModel();
  late final ChartConfigModel chartConfigModel;
  late int rightBoundEpoch;
  bool isFollowMode = false;

  void onVisibilityChange(html.Event ev) {
    if (chartConfigModel.dataFitEnabled || chartDataModel.ticks.isEmpty) {
      return;
    }

    if (html.document.visibilityState == 'visible' && isFollowMode) {
      chartConfigModel.scrollToLastTick();
    }

    if (html.document.visibilityState == 'hidden') {
      isFollowMode = rightBoundEpoch > chartDataModel.ticks.last.epoch;
    }
  }

  @override
  void initState() {
    super.initState();
    html.document.addEventListener('visibilitychange', onVisibilityChange);
  }

  @override
  void dispose() {
    super.dispose();
    html.document.removeEventListener('visibilitychange', onVisibilityChange);
  }

  @override
  Widget build(BuildContext context) => MultiProvider(
        providers: <ChangeNotifierProvider<dynamic>>[
          ChangeNotifierProvider<ChartConfigModel>.value(
              value: chartConfigModel),
          ChangeNotifierProvider<ChartDataModel>.value(value: chartDataModel)
        ],
        child: Scaffold(
          body: Center(
            child: Column(
              children: <Widget>[
                Expanded(
                  child: Consumer2<ChartConfigModel, ChartDataModel>(builder:
                      (BuildContext context, ChartConfigModel chartConfigModel,
                          ChartDataModel chartDataModel, Widget? child) {
                    if (chartDataModel.ticks.isEmpty) {
                      return Container(
                        color: chartConfigModel.theme is ChartDefaultLightTheme
                            ? Colors.white
                            : Colors.black,
                        constraints: const BoxConstraints.expand(),
                      );
                    }

                    final DataSeries<Tick> mainSeries =
                        getDataSeries(chartDataModel, chartConfigModel);

                    final Color latestTickColor = Color.fromRGBO(255, 68, 81,
                        chartConfigModel.isSymbolClosed ? 0.32 : 1);

                    return DerivChart(
                      mainSeries: mainSeries,
                      annotations: chartDataModel.ticks.length > 4
                          ? <Barrier>[
                              if (chartConfigModel.isLive)
                                TickIndicator(
                                  chartDataModel.ticks.last,
                                  style: HorizontalBarrierStyle(
                                      color: latestTickColor,
                                      labelShape: LabelShape.pentagon,
                                      hasBlinkingDot:
                                          !chartConfigModel.isSymbolClosed,
                                      hasArrow: false,
                                      textStyle: const TextStyle(
                                        fontSize: 12,
                                        height: 1.3,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                        fontFeatures: <FontFeature>[
                                          FontFeature.tabularFigures()
                                        ],
                                      )),
                                  visibility: HorizontalBarrierVisibility
                                      .keepBarrierLabelVisible,
                                ),
                            ]
                          : null,
                      pipSize: chartConfigModel.pipSize ?? 2,
                      granularity: chartConfigModel.granularity ?? 1000,
                      controller: _controller,
                      theme: chartConfigModel.theme,
                      onVisibleAreaChanged: (int leftEpoch, int rightEpoch) {
                        if (!chartDataModel.waitingForHistory &&
                            chartDataModel.ticks.isNotEmpty &&
                            leftEpoch < chartDataModel.ticks.first.epoch) {
                          chartDataModel.loadHistory(2500);
                        }
                        rightBoundEpoch = rightEpoch;
                        JsInterop.onVisibleAreaChanged(leftEpoch, rightEpoch);
                      },
                      onQuoteAreaChanged:
                          (double topQuote, double bottomQuote) {
                        JsInterop.onQuoteAreaChanged(topQuote, bottomQuote);
                      },
                      markerSeries: MarkerGroupSeries(
                        SplayTreeSet<Marker>(),
                        markerGroupList: chartConfigModel.markerGroupList,
                        markerGroupIconPainter: getMarkerGroupPainter(
                          context,
                          chartConfigModel.contractType,
                        ),
                      ),
                      drawingToolsRepo:
                          chartConfigModel.indicators.drawingToolsRepo,
                      indicatorsRepo:
                          chartConfigModel.indicators.indicatorsRepo,
                      dataFitEnabled: chartConfigModel.dataFitEnabled,
                      showCrosshair: chartConfigModel.showCrosshair,
                      isLive: chartConfigModel.isLive,
                      onCrosshairDisappeared: JsInterop.onCrosshairDisappeared,
                      onCrosshairHover:
                          (PointerHoverEvent ev, int epoch, String quote) {
                        JsInterop.onCrosshairHover(
                            ev.position.dx, ev.position.dy, epoch, quote);
                      },
                      maxCurrentTickOffset: 300,
                      msPerPx: chartConfigModel.msPerPx,
                      leftMargin: chartConfigModel.leftMargin,
                    );
                  }),
                ),
              ],
            ),
          ),
        ),
      );
}
