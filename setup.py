import setuptools


setuptools.setup(
    setup_requires=['pbr>=2.0.0'],
    include_package_data=True,
    pbr=True,
    data_files=[
        ('/etc/conf', ['etc/vstackboard-sample.conf']),
        ('/usr/lib/systemd/system', ['install/vstackboard.service'])
    ]
)
