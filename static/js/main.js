exports.postAceInit = function(hook_name, args) {

  // if the button already exists, don't write it again..
  if($('#ep_group_pad_list_button_span').length === 0) {
    var link = clientVars.ep_group_pad_list.link;
    var button = "<li><a id='ep_group_pad_list_button'><span id='ep_group_pad_list_button_span' class='buttonicon'><a target='_blank' href='/list'><img id='ep_group_pad_list_button_image' height='16' width='16' src='/static/plugins/ep_group_pad_list/static/image/list.png'/></a></span></a></li><li class='separator'></li>";
    var $editBar = $("#editbar");
    $editBar.contents().find(".buttonicon-import_export").parent().parent().before(button);
    $('#ep_group_pad_list_button_span').css({"background-image":"none", "width": "auto", "color":"#666", "font-size":"16px", "margin-top":"-3px"});
  }
}
