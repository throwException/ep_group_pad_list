exports.postAceInit = function(hook_name, args) {
  // if the button already exists, don't write it again..
  if($('#ep_group_pad_list_button_span').length === 0) {
    var button = "<li class='separator'></li><li><a title='Pad List' aria-label='Pad List' id='ep_group_pad_list_button' target='_blank' href='/list'><span id='ep_group_pad_list_button_span' class='buttonicon'><img id='ep_group_pad_list_button_image' height='16' width='16' src='/static/plugins/ep_group_pad_list/static/image/list.png'/></span></a></li>";
    var $editBar = $("#editbar");
    $editBar.contents().find(".buttonicon-embed").parent().parent().after(button);
    $('#ep_group_pad_list_button_span').css({"background-image":"none", "width": "auto", "color":"#666", "font-size":"16px", "margin-top":"-3px"});
  }
}
