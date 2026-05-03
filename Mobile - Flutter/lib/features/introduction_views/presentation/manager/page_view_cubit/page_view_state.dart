part of 'page_view_cubit.dart';

sealed class PageViewState {}

final class PageViewInitial extends PageViewState {}

final class PageViewScroll extends PageViewState {
  int index;
  PageViewScroll({required this.index});
}
