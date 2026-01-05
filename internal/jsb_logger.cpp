#include "jsb_logger.h"

namespace jsb::internal
{
    Logger::_print_line_callback Logger::_print_line = Logger::_default_print_line;
    Logger::_print_line_callback Logger::_print_verbose = Logger::_default_print_verbose;
    Logger::_print_error_callback Logger::_print_error = Logger::_default_print_error;
} // namespace jsb::internal
