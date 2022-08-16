import nox


@nox.session
def flake8(session):
    session.install("flake8")
    session.run("flake8", "vstackboard", "tests", 'noxfile.py')


@nox.session(name='ut')
def test(session):
    session.install('pytest')
    session.install('-r', 'requirements.txt', '-r', 'test-requirements.txt')

    test_files = session.posargs or ['tests']
    session.run('pytest', *test_files)