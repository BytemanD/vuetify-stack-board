
import mock
import unittest

from vstackboard import server


class ServerTestCases(unittest.TestCase):

    @mock.patch('vstackboard.common.dbconf.DBApi.exists', return_value=True)
    @mock.patch('vstackboard.db.api.init')
    @mock.patch('tornado.web.Application.listen')
    @mock.patch('tornado.ioloop.IOLoop.instance', return_value=mock.Mock())
    def test_start_with_dev(self, mock_instance, mock_listen, mock_init,
                            mock_exists):
        server.start(develop=True)
        mock_init.assert_called_once()
        mock_listen.assert_called_once()
        mock_instance.assert_called_once()

    @mock.patch('vstackboard.common.dbconf.DBApi.exists', return_value=True)
    @mock.patch('vstackboard.db.api.init')
    @mock.patch('tornado.httpserver.HTTPServer.start')
    @mock.patch('tornado.ioloop.IOLoop.instance', return_value=mock.Mock())
    def test_start_with_not_dev(self, mock_instance, mock_start, mock_init,
                                mock_exists):
        server.start()
        mock_init.assert_called_once()
        mock_start.assert_called_once()
        mock_instance.assert_called_once()
