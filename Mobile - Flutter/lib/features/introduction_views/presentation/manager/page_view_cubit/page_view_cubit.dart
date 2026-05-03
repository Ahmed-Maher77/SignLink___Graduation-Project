import 'package:flutter_bloc/flutter_bloc.dart';

part 'page_view_state.dart';

class PageViewCubit extends Cubit<PageViewState> {
  PageViewCubit() : super(PageViewInitial());
  void scroll({required int index}) => emit(PageViewScroll(index: index));
}
