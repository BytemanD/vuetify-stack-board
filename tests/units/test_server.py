
import mock
import unittest

from sqlalchemy import false

from vstackboard.cmd import vsb


class ServeCliTestCases(unittest.TestCase):

    def setUp(self) -> None:
        super().setUp()
        self.cli = vsb.Serve()

    @mock.patch('vstackboard.common.dbconf.DBApi.exists', return_value=True)
    @mock.patch('easy2use.web.application.TornadoApp.start')
    @mock.patch('vstackboard.db.api.init')
    def test_serve_with_not_dev(self, mock_init, mock_start, mock_exists):
        fake_args = mock.Mock(port=None, dev=false)
        self.cli(fake_args)
        mock_init.assert_called_once()
        mock_start.assert_called_once()
