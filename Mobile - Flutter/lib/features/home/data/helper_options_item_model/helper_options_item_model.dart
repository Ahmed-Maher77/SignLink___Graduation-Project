import 'package:flutter/material.dart';

class HelperOptionsItemModel {
  final String title;
  final String leadingIcon;
  final String? trailingIcon;

  final bool isLastItem;
  final WidgetBuilder? widgetBuilder;
  // ignore: non_constant_identifier_names
  HelperOptionsItemModel({
    required this.title,
    required this.leadingIcon,
    this.widgetBuilder,
    this.isLastItem = false,
    this.trailingIcon,
  });
}
