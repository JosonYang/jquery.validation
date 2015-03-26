/**
 * jQuery Validation plugin
 * 这个插件主要用于对输入框验证
 * 
 * @author Joson Yang
 * @version 1.0.0
 * @category jQuery plugin
 * @copyright (c) 2008－2015 JosonYang(258490116@qq.com)
 * 
 */
(function($){
	
		$.fn.validator = function(settings){

			settings = jQuery.extend({
				error_array 		: [],/*存储错误信息数组*/
				valid_obj 			: [['', '']],/*验证对象及验证规则的设置比如验证控件ID为uername,验证方式为验证Email,那么设置为['username','reg_email']*/
				error_message 		: {
					reg_required_message 				: "<li>The %s field is required.</li>",
					reg_email_message 			: "<li>The %s field must contain a valid email address.</li>",
					reg_url_message 			: "<li>The %s field must contain a valid URL.</li>",
					reg_chinesechar_message 	: "<li>The %s field must contain chinese char.</li>",
					reg_is_numeric_message 				: "<li>The %s field must contain a number.</li>",
					reg_min_length_message 				: "<li>The %s field must be at least %n characters in length.</li>",
					reg_max_length_message 				: "<li>The %s field can not exceed %n characters in length.</li>",
					reg_ip_message 				: "<li>The %s field must contain a valid IP.</li>"
				},	/*设置error_message约定，%s替换字符串,%n替换数字 */
				rules 				:{
					reg_required 		: /.+/,
					reg_email 			: /^\w+([-+.]\w+)*@\w+([-.]\\w+)*\.\w+([-.]\w+)*$/,  /*email regular*/
					reg_url 			: /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
					reg_chinesechar 	: /^[\u0391-\uFFE5]+$/,
					reg_is_numeric 		: /^\d+$/
					//reg_valid_ip 		: ""
					
				},
				show_error_div 		: 'zzz',
				output_error_msg	: false,/*false每个控件只显示一次错误,true则都显示*/
				error_position 		: false, /*如果你设置为true那么将显示在控件的旁边，如果设置为false那么将显示到统一的DIV中*/
				func_single_param 	: /(.*?)\[(.*?)\]/,// 如果存在函数有参数需要传入这个正则的作用就是分离函数和函数				
				fade_speed		: 1
			},settings);
		
			
			/*main function*/
			function run()
			{
				/**
				 * 移除所有的报错信息
				 */
				$("div").remove(".Jvalidator-error");
				/*每次做验证前错误信息必须置空，否则信息保存在数组中*/
				settings.error_array = [];
				//如果未设置验证对象，则返回FALSE
				if (settings.valid_obj.length <= 0)
				{
					return false;
				}
				
				//设置验证对象后，取出子数组中的验证规则及所需验证对象
				for (var i = 0; i < settings.valid_obj.length; i++)
				{
					//如果其中有验证规则没有设置，则继续逻辑
					if(settings.valid_obj[i].length <= 0)
					{
						continue;
					}
					/**
					 *@abstract 验证空间对象
					 *
					 *Type(string)
					 */
					var ctrl_obj 		= settings.valid_obj[i][0].toLowerCase();
					/**
					 * @abstract	设置验证规则
					 * 
					 * Type(array)
					 */
					var valid_rules		= settings.valid_obj[i][1].toLowerCase().split('|');

					if (valid_rules.length <= 0)
					{
						continue;
					}
			
					
					for(j = 0; j<valid_rules.length; j++)
					{
						
						if (settings.func_single_param.test(valid_rules[j].toString()))
						{
							var valid_func = RegExp.$1;
							var fun_param  = RegExp.$2; 
							valid_func = valid_func.replace('reg', '');
						}
						else
						{
							valid_func = valid_rules[j].replace('reg', '');
						}
			
					    /**
					     * @abstract 存在验证条件的情况下调用相关函数进行验证
					     * 
					     * 利用Eval函数，这里的效果可能会有影响，待调查.TODO---
					     * 
					     * 暂且用EVAL完成效果(有待修改)
					     * 
					     * 一般函数对INPUT为空的时候不验证，只有设定验证非空才对非空验证
					     */
						try
						{
							if ($(addsharp(ctrl_obj)).length > 0)
							{
				                 if(valid_func == "_required")
				                 {
				                    continue;
				                 }
							   if (fun_param)
							   {
								    eval(valid_func+'(\''+ctrl_obj+'\','+fun_param+')');
							   }
							   else
							   {
								    eval(valid_func+'(\''+ctrl_obj+'\')');
							   }
							}
							else
							{
								if (valid_func == "_required")
								{
									_required(ctrl_obj);
								}
							}
						}
						catch(e)
						{
              				return false;
						}
					  /**
					   * 如果为FALSE，则每一个控件只显示一种错误
					   * 
					   * 如果为TRUE，则每一个控件的所有错误一起显示
					   */
					  if (settings.output_error_msg == false)
					  {
						  if (settings.error_array.toString().indexOf(ctrl_obj) > -1) 
						  {
							   break;
						  }
					  }
					}
				}
				/**
				 * @abstract 本数组为储存错误用，如果无错误则提交
				 *
				 *报错信息的格式为
				 *
				 *		<ul>
				 *			<li>
				 *				{errors}
				 *			</li>
				 *		</ul>
				 */
				if (settings.error_array.length <= 0)
				{
					return true;
				}
				else
				{
					if (settings.error_position) 
					{
						for (var k = 0; k < settings.error_array.length; k++)
						{
							var error_html= "<div id='"+settings.error_array[k][0]+"_error' class='Jvalidator-error'>";
							error_html += settings.error_array[k][1]+"</div>";
							$(addsharp(settings.error_array[k][0])).before(error_html);
							$(".Jvalidator-error").fadeTo("slow", settings.fade_speed);
						}
					}
					else
					{
						var error_html= "<div class='Jvalidator-error'><ul>";
						for (var k = 0; k < settings.error_array.length; k++)
						{
							error_html +=settings.error_array[k][1];
						}
						error_html += "</ul></div>";
						$(addsharp(settings.show_error_div)).html(error_html).fadeTo("slow", settings.fade_speed);	
					}
					$(addsharp(settings.error_array[0][0])).focus();
					return false;
				}
			}
			/**
			 * 添加错误到错误数组中
			 * 
			 * add error message into the array
			 * 
			 * @param {string} error_msg
			 */
			function add_errors(control_obj,error_msg)
			{
				settings.error_array.push([control_obj,error_msg]);
			}
			
			/**
			 * TODO
			 * 
			 * extend function 
			 */
			function get_errors()
			{
				return settings.error_array;
			}
			
			function addsharp(control_obj)
			{
        		return "#"+control_obj;
			}
			/**********************************************************************
			 * 
			 *
			 *在下面这一块，你可以自由写你的验证函数，建议写的时候按照CODE规范来写，前面加下划线
			 *函数名小写，参数小写，如果有两个单词的用下划线隔开
			 *
			 *下面的函数写的很累赘(有待修改)
			 *
			 *----------TODO--------------
			 *********************************************************************/
			/**
			 * Required
			 * 
			 * @param {string} control name
			 */
			function _required(control_object)
			{
				var ctrl_obj = $(addsharp(control_object)).val();
				if(	settings.rules.reg_required.test(ctrl_obj))
				{
					return true;
				}
				else
				{
					add_errors(control_object,settings.error_message.reg_required_message.replace('%s',control_object.toLowerCase()));
					return false;
				}
			}
			/**
			 * validate email format whether the email format is right
			 * 
			 * @param {string} control_object
			 */
			function _email(control_object)
			{
				var ctrl_obj = $(addsharp(control_object)).val();
				if(	settings.rules.reg_email.test(ctrl_obj))
				{
					return true;
				}
				else
				{
					add_errors(control_object,settings.error_message.reg_email_message.replace('%s',control_object.toLowerCase()));
					return false;
				}
			}
			/**
			 * validate url format whether the email format is right
			 * 
			 * @param {Object} control_object
			 */
			function _url(control_object)
			{
				var ctrl_obj = $(addsharp(control_object)).val();
				if(	settings.rules.reg_url.test(ctrl_obj))
				{
					return true;
				}
				else
				{
					add_errors(control_object,settings.error_message.reg_url_message.replace('%s',control_object.toLowerCase()));
					return false;
					
				}
			}
			/**
			 * validate string whether the string only include chinese char;
			 * 
			 * @param {Object} control_object
			 */
			function _chinesechar(control_object)
			{
				var ctrl_obj = $(addsharp(control_object)).val();
				if(	settings.rules.reg_chinesechar.test(ctrl_obj))
				{
					return true;
				}
				else
				{
					add_errors(control_object,settings.error_message.reg_chinesechar_message.replace('%s',control_object.toLowerCase()));
					return false;
				}
			}
			/**
			 * Is Numeric
			 * 
			 * @param {string} control name
			 */
			function _is_numeric(control_object)
			{
				var ctrl_obj = $(addsharp(control_object)).val();
				if(	settings.rules.reg_is_numeric.test(ctrl_obj))
				{
					return true;
				}
				else
				{
					add_errors(control_object,settings.error_message.reg_is_numeric_message.replace('%s',control_object.toLowerCase()));
					return false;
				}
			}
			/**
			 * Max Length
			 * 
			 * @param {string} control_object
			 * @param {string} length_param
			 */
			function _max_length(control_object, length_param)
			{
				var ctrl_obj = $(addsharp(control_object)).val();
				if(	ctrl_obj.length <= length_param)
				{
					return true;
				}
				else
				{
					add_errors(control_object,settings.error_message.reg_max_length_message.replace('%s',control_object.toLowerCase()).replace('%n',length_param.toString()));
					return false;
				}
			}
			/**
			 * Min Length
			 * 
			 * @param {string} control_object
			 * @param {string} length_param
			 */
			function _min_length(control_object, length_param)
			{
				var ctrl_obj = $(addsharp(control_object)).val();
				if(	ctrl_obj.length > length_param)
				{
					return true;
				}
				else
				{
					add_errors(control_object,settings.error_message.reg_min_length_message.replace('%s',control_object.toLowerCase()).replace('%n',length_param.toString()));
					return false;
				}
			}
			
			/*完成绑定在要验证的控件上*/
			return this.off('click').on('click',function(){
				run();
			});
		};
})(jQuery);